// bwmapnames <https://github.com/msikma/bwmapnames>
// © MIT license

import _data from './data.json' assert {type: 'json'}
import type {BwMapNamesData, BwMapName} from './types.ts'

const data: BwMapNamesData = _data

// Time the maps data was last updated.
export const lastUpdated: Date = new Date(data.lastUpdated)

// Array of map names.
export const maps: BwMapName[] = data.maps
