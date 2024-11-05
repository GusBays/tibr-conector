import { BagySetting } from '../../setting/domain/bagy/bagy-setting'
import { Setting, SettingConnection } from '../../setting/domain/setting'
import { isImporter } from '../../setting/domain/setting-helper'

export function isBagyImporter(data: Setting): data is BagySetting {
    return isImporter(data) && data.connection === SettingConnection.BAGY
}
