import productShirt from "@/assets/product-shirt.jpg";
import productGraySet from "@/assets/product-gray-set.jpg";
import productBeigeSet from "@/assets/product-beige-set.jpg";
import productSportswear from "@/assets/product-sportswear.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  description: string;
  region: "Brasil" | "Angola";
}

export const products: Product[] = [
  {
    id: "1",
    name: "Camiseta EVS Branca Clássica",
    price: 90,
    currency: "R$",
    image: productShirt,
    category: "Camisetas",
    description: "Melhor Tendência 2026 - Melhor Qualidade 2026",
    region: "Brasil",
  },
  {
    id: "2",
    name: "Conjunto Cinza EVS Premium",
    price: 500,
    currency: "R$",
    image: productGraySet,
    category: "Conjuntos",
    description: "Moletom e calça de alta qualidade com logo EVS",
    region: "Brasil",
  },
  {
    id: "3",
    name: "Conjunto Bege EVS Confort",
    price: 500,
    currency: "R$",
    image: productBeigeSet,
    category: "Conjuntos",
    description: "Conjunto confortável e elegante para o dia a dia",
    region: "Brasil",
  },
  {
    id: "4",
    name: "Conjunto Fitness EVS",
    price: 300000,
    currency: "Kz",
    image: productSportswear,
    category: "Conjuntos",
    description: "Mova-se com liberdade - Tecido tecnológico e transpirável",
    region: "Angola",
  },
  {
    id: "5",
    name: "Camiseta EVS Angola",
    price: 80000,
    currency: "Kz",
    image: productShirt,
    category: "Camisetas",
    description: "Design exclusivo EVS para Angola",
    region: "Angola",
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByRegion = (region: "Brasil" | "Angola"): Product[] => {
  return products.filter((p) => p.region === region);
};