// This is the host used for retieving block data - need to keep changing this as we are getting rate limted
export var HOST_SERVER = 'https://arweave.net'

// NB: Setting the default difficulty high will cause TNT to fail.
export const DEFAULT_DIFF = 8

export const STORE_BLOCKS_AROUND_CURRENT = 50

// The maximum size of a single POST body.
export const MAX_BODY_SIZE =  15 * 1024 * 1024 // future use in http api

// The maximum allowed size in bytes for the data field of a format=1 transaction.
export const TX_DATA_SIZE_LIMIT = 10 * 1024 * 1024

// The maximum allowed size in bytes for the combined data fields of the format=1 transactions included in a block.
export const BLOCK_TX_DATA_SIZE_LIMIT = TX_DATA_SIZE_LIMIT // Must be greater or equal to tx data size limit.

// The maximum number of transactions (both format=1 and format=2) in a block.
export const BLOCK_TX_COUNT_LIMIT = (process.env.NODE_ENV !== "production") ? 10 : 1000 

// Defines Arweave hard forks' heights.
export const FORK_HEIGHT_1_7 = (process.env.NODE_ENV !== "production") ? 0 : 235200
export const FORK_HEIGHT_1_8 = (process.env.NODE_ENV !== "production") ? 0 : 269510
export const FORK_HEIGHT_1_9 = (process.env.NODE_ENV !== "production") ? 0 : 315700
export const FORK_HEIGHT_2_0 = (process.env.NODE_ENV !== "production") ? 0 : 422250
export const FORK_HEIGHT_2_2 = (process.env.NODE_ENV !== "production") ? 0 : 500000


