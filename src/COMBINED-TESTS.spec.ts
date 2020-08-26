import axios from 'axios'
import Arweave from "arweave"
import { BlockDTO, ReturnCode, BlockIndexTuple, Wallet_List } from './types'
import { STORE_BLOCKS_AROUND_CURRENT, HOST_SERVER } from './constants'
import { validateBlockJson, validateBlockQuick } from "./BlockValidateQuick"
import { validateBlockSlow } from './BlockValidateSlow'
import { Block,	generateBlockDataSegmentBase, generateBlockDataSegment, getIndepHash } from './Block'
import { validatePoa, poaFindChallengeBlock } from './Poa'
import { retargetValidateDiff } from './Retarget'

/* *** Initialise all test data, and use in one big test file *** */

let res: ReturnCode
let blockJson: BlockDTO
let block: Block
let prevBlock: Block
let prevPrevBlock: Block
let blockIndex: BlockIndexTuple[]
let prevBlockWalletList: Wallet_List[]

beforeAll(async () => {
	const [bi, bj1, bj2, bj2WalletList, bj3] = await Promise.all([
		axios.get(HOST_SERVER+'/hash_list', { // any random node
			headers: { "X-Block-Format": "3" }  // need to set this header to get tuples
		}),
		axios.get(HOST_SERVER+'/block/height/509850'),
		axios.get(HOST_SERVER+'/block/height/509849'),
		axios.get(HOST_SERVER+'/block/height/509849/wallet_list'),
		axios.get(HOST_SERVER+'/block/height/509848'),
	])
	blockIndex = bi.data
	blockJson = bj1.data
	block = new Block(blockJson)
	prevBlock = new Block(bj2.data)
	prevBlockWalletList = (bj2WalletList.data)
	prevPrevBlock = new Block(bj3.data)
}, 60000)



describe('BlockValidateQuick Tests', () => {
  let res: ReturnCode
	let blockJson: BlockDTO
	let block: Block
	let prevBlock: Block

  beforeAll(async () => {
		const [bj1, bj2] = await Promise.all([
			axios.get(HOST_SERVER+'/block/height/509850'),
			axios.get(HOST_SERVER+'/block/height/509849'),
		])
		blockJson = bj1.data
		block = new Block(blockJson)
		prevBlock = new Block(bj2.data)
  }, 20000)

  it('validateBlockJson should return true for a valid block', async () => {
    expect(1)
		res = validateBlockJson(blockJson, blockJson.height-1 )
		
    expect(res).toEqual({code: 200, message: "Block Json OK."})
  })

  it('validateBlockQuick should return false for an out of range height', async () => {
    let ahead = validateBlockQuick( block, block.height - (STORE_BLOCKS_AROUND_CURRENT+10) )
		expect(ahead).toEqual({code: 400, message: "Height is too far ahead"})
		
    let behind = validateBlockQuick( block, block.height + (STORE_BLOCKS_AROUND_CURRENT+10) )
    expect(behind).toEqual({code: 400, message: "Height is too far behind"})
	})
	
	it('validateBlockQuick should return false for difficulty too low', async () => {
		expect(1)
		let test = Object.assign({},block)
		test.diff = -100                                                    //!! TODO: what are good/bad difficulties?
    res = validateBlockQuick(test, block.height-1 )
    expect(res).toEqual({code: 400, message: "Difficulty too low"})
	})
})

describe('Block tests', () => {

	it('generateBlockDataSegmentBase returns a valid BSDBase hash', async () => {
		expect(1)
		let hash = await generateBlockDataSegmentBase(block)
		let data = Arweave.utils.bufferTob64Url(hash)
		
		expect(data).toEqual("dOljnXSULT9pTX4wiagcUOqrZZjBWLwKBR3Aoe3-HhNAW_CiKHNsrvqwL14x6BMm") 
		//BDSBase for /height/509850 hash/si5OoWK-OcYt3LOEDCP2V4SWuj5X5n1LdoTh09-DtOppz_VkE72Cb0DCvygYMbW5
	}, 20000)

	it('generateBlockDataSegment returns a valid BSD hash', async () => {
		expect(1)
		let hash = await generateBlockDataSegment(block)
		let data = Arweave.utils.bufferTob64Url(hash)

		expect(data).toEqual("uLdZH6FVM-TI_KiA8oZCGbqXwknwyg69ur7KPrSMVPcBljPnIzeOhnPRPyOoifWV") 
		//BDSBase for /height/509850 hash/si5OoWK-OcYt3LOEDCP2V4SWuj5X5n1LdoTh09-DtOppz_VkE72Cb0DCvygYMbW5
	}, 20000)

	it('getIndepHash returns a valid hash', async () => {
		expect(1)
		let hash: any = await getIndepHash(block)
		
		expect(new Uint8Array(hash)).toEqual(block.indep_hash) 
	}, 20000)
})

describe('PoA tests', () => {
	
	it('Poa.poaFindChallengeBlock returns a valid block depth', async () => {
		let testByte =  500000n
	
		const {txRoot, blockBase, blockTop, bh} = poaFindChallengeBlock(testByte, blockIndex)
	
		expect(testByte).toBeGreaterThan(blockBase) 
		expect(testByte).toBeLessThanOrEqual(blockTop) 
	}, 20000)
	
	it('Poa.validatePoa returns true/false for valid/invalid Poa', async () => {
		expect(2)
		let good = await validatePoa(prevBlock.indep_hash, prevBlock.weave_size, blockIndex, block.poa) 
		let badPoa = prevBlock.poa
		let bad = await validatePoa(prevBlock.indep_hash, prevBlock.weave_size, blockIndex, badPoa)
	
		expect(good).toEqual(true) 
		expect(bad).toEqual(false) 
	}, 20000)
})

describe('BlockValidateSlow tests', () => {

	it('Retarget.retargetValidateDiff Validate that a new block has an appropriate difficulty.', async () =>{
		let retarget = retargetValidateDiff(block, prevBlock)
		let noRetarget = retargetValidateDiff(prevBlock, prevPrevBlock)

		expect(retarget).toEqual(true)
		expect(noRetarget).toEqual(true)

	}, 20000)


	it('validateBlockSlow should return true when given valid blocks', async () => {
		expect(1)
		res = await validateBlockSlow(block, prevBlock, blockIndex)
			
		expect(res).toEqual({code:200, message:"Block slow check OK"})
	}, 20000)

})