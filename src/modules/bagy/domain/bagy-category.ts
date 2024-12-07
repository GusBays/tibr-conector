import { Meta, Model, Timestamps } from '../../../common/contracts/contracts'

export interface BagyCategory extends Model, Meta, Timestamps {
    name: string
    slug: string
    description: string
    google_taxonomy_id: number
    parent_id: number
    image: string
    banner: string
    banner_link: string
    position: number
    depth: number
    breadcrumb: string
    children: BagyCategory[]
    active: boolean
}
