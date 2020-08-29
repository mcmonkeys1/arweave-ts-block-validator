// This is the host used for retieving block data 
export const HOST_SERVER = 'http://eu-west-1.arweave.net:1984'

export const STORE_BLOCKS_AROUND_CURRENT = 50

// The maximum size of a single POST body.
export const MAX_BODY_SIZE =  15 * 1024 * 1024 // future use in http api

// The maximum allowed size in bytes for the data field of a format=1 transaction.
export const TX_DATA_SIZE_LIMIT = 10 * 1024 * 1024

// The maximum allowed size in bytes for the combined data fields of the format=1 transactions included in a block.
export const BLOCK_TX_DATA_SIZE_LIMIT = TX_DATA_SIZE_LIMIT // Must be greater or equal to tx data size limit.

// The maximum number of transactions (both format=1 and format=2) in a block.
export const BLOCK_TX_COUNT_LIMIT = /*(process.env.NODE_ENV !== "production") ? 10 :*/ 1000 

// Defines Arweave hard forks' heights.
export const FORK_HEIGHT_1_7 = /*(process.env.NODE_ENV !== "production") ? 0 :*/ 235200
export const FORK_HEIGHT_1_8 = /*(process.env.NODE_ENV !== "production") ? 0 :*/ 269510
export const FORK_HEIGHT_1_9 = /*(process.env.NODE_ENV !== "production") ? 0 :*/ 315700
export const FORK_HEIGHT_2_0 = /*(process.env.NODE_ENV !== "production") ? 0 :*/ 422250
export const FORK_HEIGHT_2_2 = /*(process.env.NODE_ENV !== "production") ? 0 :*/ 500000

export const  POA_MIN_MAX_OPTION_DEPTH = 100

// The hashing algorithm used to verify that the weave has not been tampered with.
export const MINING_HASH_ALG = 'sha384'

// Mining difficulty and retarget constants
// The adjustment of difficutly going from SHA-384 to RandomX
// export const RANDOMX_DIFF_ADJUSTMENT = -14n //removed
// export const MIN_SHA384_DIFFICULTY = 31n //removed
//export const MIN_RANDOMX_DIFFICULTY = 17n // MIN_SHA384_DIFFICULTY + RANDOMX_DIFF_ADJUSTMENT //removed
export const DEFAULT_DIFF = 8n
export const RETARGET_BLOCKS = 10n
export const TARGET_TIME = 120n
// export const RETARGET_TOLERANCE_FLOAT = 0.1 // removed
// *New mining difficulty constants *
export const RETARGET_BLOCK_TIME = 1200n // RETARGET_BLOCKS * TARGET_TIME
export const NEW_RETARGET_TOLERANCE = 120n // RETARGET_TOLERANCE_FLOAT * RETARGET_BLOCKS_BY_TARGET_TIME
// MAX_DIFF is 2^256
export const MAX_DIFF = 115792089237316195423570985008687907853269984665640564039457584007913129639936n
// MIN_DIFF_FORK_1_8 comes from erlang function ar_retarget:switch_to_linear_diff(MIN_RANDOMX_DIFFICULTY), which is a constant = ( (2n ** 256n) - (2n ** (256n - MIN_RANDOMX_DIFFICULTY)) ) 
export const MIN_DIFF_FORK_1_8 = 115791205813783806231406193359937536394012070923692126229978523204812483330048n

// Max allowed difficulty multiplication and division factors.
// The adjustment is lower when the difficulty goes down than when
// it goes up to prevent forks - stalls are preferred over forks.
export const DIFF_ADJUSTMENT_DOWN_LIMIT = 2n
export const DIFF_ADJUSTMENT_UP_LIMIT = 4n
export const DIFF_ADJUSTMENT_UP_COMPARATOR = 300n // RETARGET_BLOCK_TIME/DIFF_ADJUSTMENT_UP_LIMIT
export const DIFF_ADJUSTMENT_DOWN_COMPARATOR = 2400n // RETARGET_BLOCK_TIME * DIFF_ADJUSTMENT_DOWN_LIMIT

// The number of blocks that pass before RandomX key changes again
export const RANDOMX_KEY_SWAP_FREQ = 2000

// How much harder it should be to mine each subsequent alternative POA option.
export const ALTERNATIVE_POA_DIFF_MULTIPLIER = 2