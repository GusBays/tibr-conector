import { AgisSetting } from '../../setting/domain/agis/agis-setting'
import { Setting, SettingConnection } from '../../setting/domain/setting'
import { isFetcher } from '../../setting/domain/setting-helper'

export function isAgisFetcher(data: Setting): data is AgisSetting {
    return isFetcher(data) && SettingConnection.AGIS === data.connection
}
