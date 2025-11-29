// Image imports for products
import productShirt from "@/assets/product-shirt.jpg";
import productGraySet from "@/assets/product-gray-set.jpg";
import productGrayFullSet from "@/assets/product-gray-full-set.jpg";
import productGrayHoodie from "@/assets/product-gray-hoodie.jpg";
import productGrayDetail from "@/assets/product-gray-detail.jpg";
import productGraySitting from "@/assets/product-gray-sitting.jpg";
import productBeigeSet from "@/assets/product-beige-set.jpg";
import productSportswear from "@/assets/product-sportswear.jpg";
import productTiedyeSet from "@/assets/product-tiedye-set.jpg";
import productTiedyeHoodie from "@/assets/product-tiedye-hoodie.jpg";
import productShirtWhite from "@/assets/product-shirt-white.jpg";
import productGrayPromo from "@/assets/product-gray-promo.jpg";
import productBeigePromo from "@/assets/product-beige-promo.jpg";
import productShirtsColors from "@/assets/product-shirts-colors.jpg";
import productFitnessFemale from "@/assets/product-fitness-female.jpg";

export const imageMap: Record<string, string> = {
  "product-shirt.jpg": productShirt,
  "product-gray-set.jpg": productGraySet,
  "product-gray-full-set.jpg": productGrayFullSet,
  "product-gray-hoodie.jpg": productGrayHoodie,
  "product-gray-detail.jpg": productGrayDetail,
  "product-gray-sitting.jpg": productGraySitting,
  "product-beige-set.jpg": productBeigeSet,
  "product-sportswear.jpg": productSportswear,
  "product-tiedye-set.jpg": productTiedyeSet,
  "product-tiedye-hoodie.jpg": productTiedyeHoodie,
  "product-shirt-white.jpg": productShirtWhite,
  "product-gray-promo.jpg": productGrayPromo,
  "product-beige-promo.jpg": productBeigePromo,
  "product-shirts-colors.jpg": productShirtsColors,
  "product-fitness-female.jpg": productFitnessFemale,
};

export const getProductImage = (imageName: string | null): string => {
  if (!imageName) return productShirt; // fallback
  return imageMap[imageName] || productShirt;
};
