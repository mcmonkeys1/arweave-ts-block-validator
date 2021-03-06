import ArCache from 'arweave-cacher'
import { BlockDTO, ReturnCode, BlockIndexDTO } from './types'
import { STORE_BLOCKS_AROUND_CURRENT, HOST_SERVER, RETARGET_BLOCKS, MIN_DIFF_FORK_1_8 } from './constants'
import { Block, blockFieldSizeLimit, block_verifyWeaveSize, block_verifyBlockHashListMerkle } from './classes/Block'
import { validatePoa, findPoaChallengeBlock } from './classes/Poa'
import { validateDifficulty } from './hashing/difficulty-retarget'
import { Tx } from './classes/Tx'
import { validateBlock } from './blockValidation'
import { WalletsObject, createWalletsFromDTO } from './classes/WalletsObject'
import { deserialize, serialize } from 'v8'

/* *** Initialise all test data, and use in one big test file *** */

jest.retryTimes(0);

let res: ReturnCode
let blockJson: BlockDTO

let block: Block
let prevBlock: Block
let prevPrevBlock: Block
let blockIndex: BlockIndexDTO 
let prevBlockWallets: WalletsObject
// nulls
const BLOCKINDEX_NULL: BlockIndexDTO = []
const WALLET_NULL = {}
const BLOCKTXPAIRS_NULL = {}

beforeAll(async () => {
	try{
		ArCache.setHostServer(HOST_SERVER)
		ArCache.setDebugMessagesOn(false)

		const currentHeight = await ArCache.getCurrentHeight()
		//we want height % 10 so we get a difficulty retarget block
		let workingHeight = currentHeight - (currentHeight % RETARGET_BLOCKS)

		const [
			bIndex, 

			bj1, 
			bj2, 
			bj2WalletList, 
			bj3
		] = await Promise.all([
			ArCache.getBlockIndex(workingHeight-1),

			ArCache.getBlockDtoByHeight(workingHeight),
			ArCache.getBlockDtoByHeight(workingHeight - 1),
			ArCache.getWalletList(workingHeight - 1),
			ArCache.getBlockDtoByHeight(workingHeight - 2),
		])
		blockIndex = bIndex

		blockJson = bj1
		block = await Block.createFromDTO(blockJson)
		prevBlock = await Block.createFromDTO(bj2)
		prevBlockWallets = createWalletsFromDTO(bj2WalletList)
		prevPrevBlock = await Block.createFromDTO(bj3)

	}catch(e){
		console.log('Network error! Could not retrieve tests data!', e.code)
		process.exit(1)
	}

}, 60000)



describe('BlockValidate Quick Tests', () => {

  it('validateBlock should return false for an out of range height', async () => {
		expect.assertions(2)

		let badHeight = deserialize(serialize(block)) 
		badHeight.height = prevBlock.height + (STORE_BLOCKS_AROUND_CURRENT + 1)

    let ahead = await validateBlock(badHeight, prevBlock, BLOCKINDEX_NULL, WALLET_NULL , BLOCKTXPAIRS_NULL)
		expect(ahead).toEqual({value: false, message: "Height is too far ahead"})
		
		badHeight.height = prevBlock.height - (STORE_BLOCKS_AROUND_CURRENT + 1)

    let behind = await validateBlock(badHeight, prevBlock, BLOCKINDEX_NULL, WALLET_NULL , BLOCKTXPAIRS_NULL)
    expect(behind).toEqual({value: false, message: "Height is too far behind"})
	})
	
	it('validateBlockQuick should return false for difficulty too low', async () => {
		expect.assertions(1)
		let test = Object.assign({},block)
		// set bad difficulty integer 1 below min diff
		test.diff = MIN_DIFF_FORK_1_8 - 1n 

    res = await validateBlock(test, prevBlock, BLOCKINDEX_NULL, WALLET_NULL , BLOCKTXPAIRS_NULL)
    expect(res).toEqual({value: false, message: "Difficulty too low"})
	})

})

describe('BlockValidateSlow tests, general validation tests', () => {
	it('Quickly returns false for quick validation against wrong previous block height or hash', async () => {
		expect.assertions(2)
		let badPrevBlock: Block

		//create bad height
		badPrevBlock = Object.assign({}, prevBlock)
		badPrevBlock.height--
		let badHeightResult = await validateBlock(block, badPrevBlock, blockIndex, prevBlockWallets, BLOCKTXPAIRS_NULL)

		expect(badHeightResult).toEqual({value: false, message: "Invalid previous height"})

		//create bad hash
		badPrevBlock = Object.assign({}, prevBlock)
		badPrevBlock.indep_hash = prevBlock.indep_hash.map(byte => byte ^ 0xff) //flip all the bits (╯°□°）╯︵ ┻━┻
		let badHashResult = await validateBlock(block, badPrevBlock, blockIndex, prevBlockWallets, BLOCKTXPAIRS_NULL)

		expect(badHashResult).toEqual({value: false, message: "Invalid previous block hash"})
	})
})

describe('Block tests, general validation tests', () => {

	it('blockFieldSizeLimit returns true/false for valid/invalid field sizes', async () => {
		expect.assertions(2)
		let good = blockFieldSizeLimit(block)
		
		expect(good).toEqual(true) 

		let badBlock = Object.assign({}, block)
		badBlock.reward_addr = new Uint8Array(33) // this should be 256bit; 32 bytes
		let bad = blockFieldSizeLimit(badBlock)

		expect(bad).toEqual(false)
	})

	it('block_verifyWeaveSize returns true for valid block weave size', async () => {
		expect.assertions(1)
		let result = block_verifyWeaveSize(block, prevBlock)
		
		expect(result).toEqual(true) 
	})

	it('block_verifyBlockHashListMerkle returns true/false for valid/invalid block index root hash', async () => {
		expect.assertions(2)
		let good = await block_verifyBlockHashListMerkle(block, prevBlock)
		
		expect(good).toEqual(true) 

		//now mix the blocks up to get invalid blockIndex root hash
		let bad = await block_verifyBlockHashListMerkle(prevBlock, block)
		
		expect(bad).toEqual(false) 
	})

})

describe('PoA tests', () => {

	it('findPoaChallengeBlock returns a valid block depth', async () => {
		expect.assertions(2)
		let testByte =  10000000n
		
		const {blockBase, blockTop} = findPoaChallengeBlock(testByte, blockIndex)
	
		expect(testByte).toBeGreaterThan(blockBase) 
		expect(testByte).toBeLessThanOrEqual(blockTop) 
	}, 20000)
	
	it('validatePoa returns true/false for valid/invalid Poa', async () => {
		expect.assertions(2)
		let good = await validatePoa(prevBlock.indep_hash, prevBlock.weave_size, blockIndex, block.poa) 

		let badPoa = Object.assign({}, block.poa)
		badPoa.chunk = block.poa.chunk.map(byte=> byte ^ 0xff) //flip all the bits (╯°□°）╯︵ ┻━┻
		let bad = await validatePoa(prevBlock.indep_hash, prevBlock.weave_size, blockIndex, badPoa)
	
		expect(good).toEqual(true) 
		expect(bad).toEqual(false) 
	})
})

describe('Difficulty tests', () => {

	it('Difficulty. retarget_ValidateDiff Validate that a new block has an appropriate Difficulty.', async () =>{
		expect.assertions(2)
		let retarget = validateDifficulty(block, prevBlock)
		let noRetarget = validateDifficulty(prevBlock, prevPrevBlock)

		expect(retarget).toEqual(true)
		expect(noRetarget).toEqual(true)

	}, 20000)

	it('Difficulty. retarget_ValidateDiff returns false for bad Difficulty.', async () =>{
		expect.assertions(1)
		let badTimeBlock = Object.assign({}, block)
		badTimeBlock.timestamp = prevBlock.last_retarget + 1n // this makes timedelta too short

		let retarget = validateDifficulty(badTimeBlock, prevBlock)

		expect(retarget).toEqual(false)

	}, 20000)

})

describe('Tx (Transaction) tests', () => {

	it('Tx. Checks that verify function works for v1 format txs', async () =>{
		expect.assertions(1)
		let v1Tx = await Tx.getByIdString('2ge-rXTTFeMjVEOkb2r3X1ZooyEH4foRI98CbvcimsQ')
		let verify1 = await v1Tx.verify()

		expect(verify1).toEqual(true)
	}, 20000)

	it('Tx. Checks that verify function works for v2 format txs', async () =>{
		expect.assertions(1)
		let v2Tx = await Tx.getByIdString('B3cc0u87v0SwAkTWzHu1v3Sl2vpm1cXgRGPLjtGQJvI')
		let verify2 = await v2Tx.verify()

		expect(verify2).toEqual(true)
	}, 20000)

})

