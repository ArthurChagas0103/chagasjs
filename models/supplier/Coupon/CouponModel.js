export class CouponModel {
    constructor() {
        this.localStorageKey = 'coupons';
    }

    async getAllCoupons() {
        return new Promise((resolve) => {
            const coupons = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');

            resolve(coupons);
        });
    }

    async saveAllCoupons(coupons) {
        return new Promise((resolve) => {
            try {
                localStorage.setItem(this.localStorageKey, JSON.stringify(coupons));
                resolve();
            } catch (e) {
                // Lida com possíveis erros do localStorage (ex: cota excedida)
                // Seria melhor printar o erro no console.error()?
                alert('Erro ao salvar cupons: ' + e.message);
                
                // Resolve mesmo em caso de erro para não bloquear a cadeia de promisses (estava dando erro sem isso)
                resolve(); 
            }
        });
    }

    async addCoupon(coupon) {
        const coupons = await this.getAllCoupons();
        const newCoupon = {
            couponId: "coupon_" + Date.now().toString(), // ID único simples
            ...coupon
        };
        
        coupons.push(newCoupon);
        await this.saveAllCoupons(coupons);
        return newCoupon;
    }

    async getCouponByCode(code) {
        const coupons = await this.getAllCoupons();
        const foundCoupon = coupons.find(c => c.code === code);

        return foundCoupon;
    }

    async getCouponById(couponId) {
        const coupons = await this.getAllCoupons();
        return coupons.find(coupon => coupon.couponId === couponId);
    }

    async getCouponBySupplierId(supplierId) {
        const coupons = await this.getAllCoupons();
        return coupons.filter(coupon => coupon.supplierId === supplierId);
    }

    async updateCoupon(updatedCoupon) {
        let coupons = await this.getAllCoupons();
        const index = coupons.findIndex(c => c.couponId === updatedCoupon.couponId);
        if (index !== -1) {
            coupons[index] = { ...coupons[index], ...updatedCoupon };
            await this.saveAllCoupons(coupons);
            return true;
        }
        return false;
    }

    async deleteCoupon(couponId) {
        let coupons = await this.getAllCoupons();
        const initialLength = coupons.length;
        coupons = coupons.filter(c => c.couponId !== couponId);
        if (coupons.length < initialLength) {
            await this.saveAllCoupons(coupons);
            return true;
        }
        return false;
    }
}