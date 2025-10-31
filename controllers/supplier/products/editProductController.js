export class EditProductController {
    constructor(onSave, onClose) {
        this.onSave = onSave;
        this.onClose = onClose;
        this.panel = null;
    }

    // Função principal para abrir o painel de edição
    async open(product) {
        await this.close();
        this.panel = this._createPanel(product);
        this._addPanelToDOM();
        this._registerEvents(product);
        document.body.style.overflow = 'hidden';
    }

    // Cria o HTML do painel de edição
    _createPanel(product) {
        const panel = document.createElement('div');
        panel.className = 'edit-product-panel-overlay';
        panel.innerHTML = this._getPanelHTML(product);
        return panel;
    }

    // Retorna o HTML do painel de edição
    _getPanelHTML(product) {
        return `
            <div class="edit-product-panel-modal card shadow-lg rounded-4 border-0 p-4 bg-light-cream" style="width:40vw;max-width:700px;height:auto;max-height:95vh;position:relative;display:flex;flex-direction:column;justify-content:flex-start;align-items:center;z-index:10000;overflow:hidden;">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-3" aria-label="Fechar" id="closeEditPanel"></button>
                <div class="w-100 d-flex flex-column align-items-center" style="min-width:0;">
                  <h3 class="mb-4 text-primary text-center w-100" style="word-break:break-word;">Editar Produto</h3>
                </div>
                <form id="editProductForm" style="width:100%;max-width:600px;overflow-y:auto;max-height:60vh;padding-bottom:16px;">
                    <div class="mb-3">
                        <label class="form-label">ID</label>
                        <input type="text" class="form-control" name="productId" value="${product.productId}" readonly style="background:#e9ecef;color:#6c757d;border:1px solid #ced4da;cursor:not-allowed;">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nome</label>
                        <input type="text" class="form-control" name="name" value="${product.name || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descrição</label>
                        <textarea class="form-control" name="description" rows="2" required>${product.description || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Categoria</label>
                        <select class="form-select" id="category" name="category" required>
                          <option value="" disabled ${!product.category ? 'selected' : ''}>Selecione uma categoria</option>
                          <option value="alimentos" ${product.category === 'alimentos' ? 'selected' : ''}>Alimentos</option>
                          <option value="bebidas" ${product.category === 'bebidas' ? 'selected' : ''}>Bebidas</option>
                          <option value="higiene" ${product.category === 'higiene' ? 'selected' : ''}>Higiene</option>
                          <option value="limpeza" ${product.category === 'limpeza' ? 'selected' : ''}>Limpeza</option>
                          <option value="outros" ${product.category === 'outros' ? 'selected' : ''}>Outros</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Quantidade</label>
                        <input type="number" class="form-control" name="quantity" value="${product.quantity || 1}" min="1" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Validade</label>
                        <input type="date" class="form-control" name="expirationDate" value="${product.expirationDate || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Preço (R$)</label>
                        <input type="number" class="form-control" name="price" value="${product.price || ''}" min="0" step="0.01">
                        <div class="form-text">Se o preço for <strong>0</strong>, o produto será cadastrado como <strong>Doação (Gratuito).</strong></div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Imagem atual</label>
                        <div style="text-align:center;">
                            <img src="${product.image || 'https://via.placeholder.com/200x150?text=Sem+Imagem'}" alt="Miniatura do produto" style="max-width:180px;max-height:140px;border-radius:8px;object-fit:cover;border:1px solid #dee2e6;margin-bottom:8px;" />
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Mudar imagem?</label>
                        <input type="file" class="form-control" name="image" accept="image/*">
                        <small class="form-text text-muted">Selecione uma imagem para o produto (JPG, PNG, GIF, WEBP).</small>
                    </div>
                </form>
                <div class="d-flex justify-content-end gap-2 mt-4 flex-wrap w-100" style="z-index:2;">
                    <button type="button" class="btn btn-secondary" id="cancelEditPanel">Cancelar</button>
                    <button type="submit" class="btn btn-primary" form="editProductForm">Salvar</button>
                </div>
            </div>
        `;
    }

    // Adiciona o painel ao main#app
    _addPanelToDOM() {
        const appMain = document.querySelector('main#app');
        if (appMain) {
            appMain.appendChild(this.panel);
        } else {
            document.body.appendChild(this.panel);
        }
    }

    // Registra todos os eventos necessários do painel
    _registerEvents(product) {
        this._registerCloseEvent();
        this._registerCancelEvent();
        this._registerDonationPriceEvent();
        this._registerSubmitEvent(product);
    }

    // Evento para fechar o painel
    _registerCloseEvent() {
        this.panel.querySelector('#closeEditPanel').onclick = async () => await this.close();
    }

    // Evento para cancelar edição
    _registerCancelEvent() {
        this.panel.querySelector('#cancelEditPanel').onclick = async () => await this.close();
    }

    // Evento para atualizar tipo de oferta se preço for zero
    _registerDonationPriceEvent() {
        const priceInput = this.panel.querySelector('input[name="price"]');
        const offerTypeSelect = this.panel.querySelector('select[name="offerType"]');
        if (priceInput && offerTypeSelect) {
            priceInput.addEventListener('input', function() {
                if (Number(priceInput.value) === 0) {
                    offerTypeSelect.value = 'Donation';
                }
            });
        }
    }

    // Evento de submit do formulário de edição (salva e depois fecha)
    _registerSubmitEvent(product) {
        this.panel.querySelector('#editProductForm').onsubmit = async (e) => {
            e.preventDefault();
            const updatedProduct = await this._processForm(product, e.target);
            await this.onSave(updatedProduct);
            await this.close();
        };
    }

    // Processa os dados do formulário e retorna o produto atualizado
    async _processForm(product, form) {
        const formData = new FormData(form);
        const updatedProduct = {};
        for (const [key, value] of formData.entries()) {
            updatedProduct[key] = value;
        }
        updatedProduct.quantity = Number(updatedProduct.quantity);
        updatedProduct.price = updatedProduct.price ? Number(updatedProduct.price) : '';
        // Se preço for zero, define oferta como doação
        if (Number(updatedProduct.price) === 0) {
            updatedProduct.offerType = 'donation';
        }
        // Processa imagem se houver novo arquivo
        const imageInput = this.panel.querySelector('input[name="image"]');
        if (imageInput && imageInput.files && imageInput.files[0]) {
            updatedProduct.image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(imageInput.files[0]);
            });
        } else {
            // Mantém imagem anterior se não houver novo arquivo (necessário pq estava removendo a imagem existente em caso de não edição)
            updatedProduct.image = product.image;
        }
        return updatedProduct;
    }

    // Fecha o painel e limpa o DOM
    async close() {
        if (this.panel) {
            if (this.panel.parentNode) {
                this.panel.parentNode.removeChild(this.panel);
            }
            document.body.style.overflow = '';
            this.panel = null;
        }
        if (typeof this.onClose === 'function') await this.onClose();
    }
}