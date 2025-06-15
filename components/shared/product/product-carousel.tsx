"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

const ProductCarousel = ({ data }: { data: Product[] }) => {
  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 10000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    []
  );

  const getImagePath = (bannerPath: string | null | undefined): string => {
    const localImageBasePath = "/images/";

    if (!bannerPath) {
      return `${localImageBasePath}banner-1.jpg`;
    }

    if (/^(https?:)?\/\//i.test(bannerPath)) {
      return bannerPath;
    }

    if (bannerPath.startsWith(localImageBasePath)) {
      return bannerPath;
    }

    const imageName = bannerPath.startsWith("/")
      ? bannerPath.substring(1)
      : bannerPath;
    return `${localImageBasePath}${imageName}`;
  };

  return (
    <Carousel
      className="w-full mb-12"
      opts={{
        loop: true,
      }}
      plugins={[autoplayPlugin]}
    >
      <CarouselContent>
        {data.map((product: Product) => {
          const imageSrc = getImagePath(product.banner);
          return (
            <CarouselItem key={product.id}>
              <Link href={`/product/${product.slug}`}>
                <div className="relative mx-auto">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    height={0}
                    width={0}
                    sizes="100vw"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-end justify-center">
                    <h2 className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                      {product.name}
                    </h2>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default ProductCarousel;
