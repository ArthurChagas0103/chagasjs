import { CouponModel } from '../../../models/supplier/Coupon/CouponModel.js';

export class CouponsController {
    constructor(formId, tableId) {
        this.couponModel = new CouponModel();
        this.couponForm = document.getElementById(formId);
        this.couponTableBody = document.getElementById(tableId);
        this.user = this.getCurrentUser();

        // Verifica se o usuário logado é fornecedor
        if (this.user && this.user.type === 'supplier') {
            this.start();
        } else {
            alert('Você não tem permissão para acessar esta página.');
            window.location.href = '/';
            return;
        }
    }

    // Inicializa o controller
    start() {
        this.couponIdInput = document.getElementById('couponId');
        this.saveCouponButton = document.getElementById('saveCouponButton');
        this.stopEditingButton = document.getElementById('stopEditingButton');
        
        this.couponTableBody.classList.remove('invisible');
        this.loadCoupons();
        this._initEvents();
    }

    _initEvents() {
        this.couponForm.addEventListener('submit', (event) => this._onSubmit(event));

        this.stopEditingButton.addEventListener('click', (event) => this._onStopEditing(event));
    }

    // Salva os dados do usuário logado
    getCurrentUser() {
        return JSON.parse(localStorage.getItem("account")) || {};
    }

    async loadCoupons() {
        const coupons = await this.couponModel.getCouponBySupplierId(this.user.ID);

        // Limpa a tabela antes de preencher novamente
        this.couponTableBody.innerHTML = '';
       
        // Caso tenha cupons cadastrados por esse fornecedor
        if (coupons.length > 0) {
            coupons.forEach(coupon => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${coupon.code}</td>
                    <td>${coupon.discount}%</td>
                    <td>${coupon.expirationDate}</td>
                    <td>${coupon.quantity || 'N/A'}</td>
                    <td>${coupon.description || ''}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-link text-decoration-none text-secondary me-1" data-action="edit" data-id="${coupon.couponId}" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button class="btn btn-sm btn-link text-danger text-decoration-none" data-action="delete" data-id="${coupon.couponId}" title="Excluir">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                `;
                this.couponTableBody.appendChild(row);

                // Adicionando eventos aos botões de ação (edit e delete)
                row.querySelector('button[data-action="edit"]').addEventListener('click', (event) => this._onEditCoupon(event));
                row.querySelector('button[data-action="delete"]').addEventListener('click', (event) => this._onDeleteCoupon(event));
            });
        } 
        // Caso não tenha nenhum cupom cadastrado por esse fornecedor
        else {
            const noCouponsRow = document.createElement('tr');
            noCouponsRow.innerHTML = `<td colspan="6" class="text-center text-muted">Nenhum cupom cadastrado.</td>`;
            this.couponTableBody.appendChild(noCouponsRow);
        }
    }

    // Lida com o envio do formulário
    async _onSubmit(event) {
        event.preventDefault();
    
        const formData = new FormData(this.couponForm);
        const couponData = {
            supplierId: this.user.ID,
            code: formData.get('code'),
            discount: parseInt(formData.get('discount'), 10),
            expirationDate: formData.get('expirationDate'),
            quantity: parseInt(formData.get('quantity'), 10) || null,
            description: formData.get('description')
        };
    
        // Validação básica
        if (!couponData.code || !couponData.discount || !couponData.expirationDate) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
    
        // Verifica se é uma edição ou um novo cupom
        const couponId = this.couponIdInput.value;
        try {
            if (couponId) {
                // Atualiza o cupom existente
                await this.couponModel.updateCoupon({ ...couponData, couponId });
                alert('Cupom atualizado com sucesso!');
            } else {
                // Adiciona um novo cupom
                await this.couponModel.addCoupon(couponData);
                alert('Cupom adicionado com sucesso!');
            }
            this._onStopEditing(); // Limpa o formulário e reseta o texto no botão de submit
            await this.loadCoupons(); // Recarrega os cupons após a ação para atualizar a tabela na tela
        } catch (error) {
            alert('Falha ao salvar cupom. Por favor, tente novamente.');
        }
    
        return false;
    }
    
    // Lida com o clique no botão de exclusão de cupom
    async _onDeleteCoupon(event) {
        event.preventDefault(); // Evita que o link seja seguido

        const couponId = event.currentTarget.dataset.id;
            if (confirm('Tem certeza que deseja excluir este cupom?')) {
                try {
                    await this.couponModel.deleteCoupon(couponId);
                    await this.loadCoupons();
                } catch (error) {
                    console.error('Erro ao excluir cupom:', error);
                    alert('Falha ao excluir cupom. Por favor, tente novamente.');
                }
            }
        }

    async _onEditCoupon(event) {
        event.preventDefault();
        const couponId = event.currentTarget.dataset.id;
        const coupon = await this.couponModel.getCouponById(couponId);
        if (coupon) {
            this.couponIdInput.value = coupon.couponId;
            this.couponForm.elements['code'].value = coupon.code;
            this.couponForm.elements['discount'].value = coupon.discount;
            this.couponForm.elements['expirationDate'].value = coupon.expirationDate;
            this.couponForm.elements['quantity'].value = coupon.quantity;
            this.couponForm.elements['description'].value = coupon.description;
            this.saveCouponButton.querySelector('span').textContent = 'Atualizar cupom';
            this.stopEditingButton.classList.remove('invisible');
        }
    }

    _onStopEditing() {
        this.couponForm.reset();
        this.couponIdInput.value = '';
        this.saveCouponButton.querySelector('span').textContent = 'Salvar cupom';
        this.stopEditingButton.classList.add('invisible');
    }
}