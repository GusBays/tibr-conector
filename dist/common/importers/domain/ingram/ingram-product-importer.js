"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngramProductImporter = void 0;
const ingram_request_1 = require("../../../request/domain/ingram/ingram-request");
const importer_1 = require("../importer");
const package_helper_1 = require("../../../../modules/package/domain/package-helper");
const bling_request_1 = require("../../../request/domain/bling/bling-request");
class IngramProductImporter extends importer_1.Importer {
    constructor(data) {
        super(data, new ingram_request_1.IngramRequest(data.settings.access_token));
    }
    importAllBy(target) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                pageNumber: 1,
                pageSize: 100
            };
            let totalRecords = 0;
            let processedRecords = 0;
            do {
                const res = yield this.request.catalog(params);
                const toImportOne = (product) => __awaiter(this, void 0, void 0, function* () { return yield this.importOne(product, target); });
                yield Promise.all(res.catalog.map(toImportOne));
                if (1 === params.pageNumber)
                    totalRecords = res.recordsFound;
                processedRecords += res.catalog.length;
                params.pageNumber++;
            } while (processedRecords < totalRecords);
        });
    }
    importOne(ingramProduct, target) {
        return __awaiter(this, void 0, void 0, function* () {
            const productConfig = yield this.productService.getOne({ source_register_id: ingramProduct.vendorPartNumber, target_id: target.id });
            let product;
            if ((0, package_helper_1.isBlingPackage)(target))
                product = yield this.createProductOnBling(ingramProduct, target, productConfig);
            else
                throw new Error('not_implemented_ingram_target');
            yield this.productService.save(product);
        });
    }
    createProductOnBling(product, target, productConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const blingRequest = new bling_request_1.BlingRequest(target.settings.access_token);
            const [detail, priceAndAvailability] = yield Promise.all([
                this.request.catalogDetail(product.vendorPartNumber),
                this.request.priceAndAvailability({ products: [{ vendorPartNumber: product.vendorPartNumber }] })
            ]);
            const { additionalInformation, productDetailDescription } = detail;
            const [{ availability, pricing }] = priceAndAvailability;
            const { category, subCategory } = product;
            const blingCategory = {};
            if (category) {
                const categoryConfig = { source_id: this.data.id, target_id: target.id };
                const filter = { source_id: this.data.id, target_id: target.id };
                let categoryRow = yield this.categoryService.getOne(Object.assign(Object.assign({}, filter), { source_register_id: category }));
                if (categoryRow)
                    Object.assign(blingCategory, { id: +categoryRow.target_register_id, descricao: categoryRow.name });
                else {
                    const res = yield blingRequest.createCategory({ descricao: category });
                    blingCategory.id = res.id;
                    categoryRow = yield this.categoryService.create(Object.assign(Object.assign({}, categoryConfig), { target_register_id: String(blingCategory.id), name: subCategory }));
                }
                if (subCategory) {
                    const subCategoryRow = yield this.categoryService.getOne(Object.assign(Object.assign({}, filter), { source_register_id: subCategory }));
                    if (subCategoryRow)
                        Object.assign(blingCategory, { id: +subCategoryRow.target_register_id, descricao: subCategoryRow.name, categoriaPai: { id: categoryRow.id } });
                    else {
                        const res = yield blingRequest.createCategory({ descricao: subCategory, categoriaPai: { id: categoryRow.id } });
                        blingCategory.id = res.id;
                        blingCategory.categoriaPai = { id: categoryRow.id };
                        yield this.categoryService.create(Object.assign(Object.assign({}, categoryConfig), { target_register_id: String(blingCategory.id), name: subCategory, parent_id: categoryRow.id }));
                    }
                }
            }
            const price = (productConfig === null || productConfig === void 0 ? void 0 : productConfig.markup) ? pricing.customerPrice * productConfig.markup : pricing.customerPrice;
            const productWeight = additionalInformation.productWeight.at(0);
            const toBlingImage = (image) => ({ link: image.src });
            const blingImages = productConfig === null || productConfig === void 0 ? void 0 : productConfig.images.map(toBlingImage);
            const blingProduct = {
                nome: productDetailDescription,
                codigo: product.vendorPartNumber,
                preco: price,
                tipo: 'P',
                situacao: 'A',
                formato: 'S',
                descricaoCurta: product.description,
                dataValidade: null,
                unidade: 'UN',
                volumes: 1,
                itensPorCaixa: 1,
                pesoBruto: productWeight.weight,
                pesoLiquido: productWeight.weight,
                gtin: null,
                gtinEmbalagem: null,
                tipoProducao: "P",
                condicao: 0,
                freteGratis: false,
                marca: product.vendorName,
                descricaoComplementar: null,
                linkExterno: null,
                observacoes: null,
                descricaoEmbalagemDiscreta: null,
                categoria: (blingCategory === null || blingCategory === void 0 ? void 0 : blingCategory.id) ? blingCategory : null,
                estoque: {
                    minimo: 0,
                    maximo: null,
                    crossdocking: 1,
                    localizacao: null
                },
                actionEstoque: '',
                dimensoes: {
                    altura: +additionalInformation.height,
                    largura: +additionalInformation.width,
                    profundidade: +additionalInformation.length,
                    unidadeMedida: 1
                },
                tributacao: null,
                midia: {
                    video: null,
                    imagens: {
                        externas: blingImages
                    }
                },
                linhaProduto: null,
                estrutura: null,
                camposCustomizados: null,
                variacoes: null
            };
            let result;
            if (productConfig)
                result = yield blingRequest.updateProduct(blingProduct);
            else
                result = yield blingRequest.createProduct(blingProduct);
            return Object.assign(Object.assign({}, productConfig), { source_id: this.data.id, source_register_id: product.vendorPartNumber, target_id: target.id, target_register_id: result.id, name: blingProduct.nome, description: blingProduct.descricaoComplementar, balance: availability.totalAvailability });
        });
    }
}
exports.IngramProductImporter = IngramProductImporter;
//# sourceMappingURL=ingram-product-importer.js.map