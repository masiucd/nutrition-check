import {create} from "zustand"
import {createJSONStorage, persist} from "zustand/middleware"

interface CartStore {
	products: Array<{id: string; name: string; price: number}>
	addProduct: (product: {id: string; name: string; price: number}) => void
	removeProduct: (productId: string) => void
	findProduct: (productId: string) => {id: string; name: string; price: number} | undefined
	clearCart: () => void
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			products: [],
			addProduct: product =>
				set(state => ({
					products: [...state.products, product],
				})),
			removeProduct: productId =>
				set(state => ({
					products: state.products.filter(p => p.id !== productId),
				})),
			findProduct: productId => {
				let {products} = get()
				return products.find(p => p.id === productId)
			},
			clearCart: () => set({products: []}),
		}),
		{
			name: "cart-storage",
			// locatstorage is default but we specify it explicitly for clarity
			storage: createJSONStorage(() => localStorage),
		},
	),
)
