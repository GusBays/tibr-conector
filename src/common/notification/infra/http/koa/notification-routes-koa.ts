import { Context } from 'koa'
import Router from 'koa-router'
import { KoaHelper } from '../../../../http/domain/koa/koa-helper'
import { Notification, NotificationData } from '../../../domain/notification'

const path = '/notifications'

export function notificationRoutesKoa(router: Router) {
    const { preview } = notificationHandler()

    router.post(`${path}/preview`, preview)
}

function notificationHandler() {
    const preview = async (ctx: Context) => {
        const template = Notification.render(KoaHelper.extractBody<NotificationData>(ctx))
        ctx.type = 'text/html'
        ctx.body = template
    }

    return { preview }
}
