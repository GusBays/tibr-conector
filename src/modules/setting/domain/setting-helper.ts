import { FetcherSetting, Setting, SettingType } from './setting'

export function isFetcher(data: Setting): data is FetcherSetting {
    return SettingType.FETCHER === data.type
}

export function isImporter(data: Setting): data is FetcherSetting {
    return SettingType.IMPORTER === data.type
}
