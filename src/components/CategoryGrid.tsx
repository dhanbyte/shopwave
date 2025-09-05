import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface Category {
  name: string;
  href: string;
  image: string;
  dataAiHint: string;
}

interface CategoryGridProps {
  categories: Category[];
  buttonColor?: string;
}

export default function CategoryGrid({ categories, buttonColor }: CategoryGridProps) {
  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link key={category.name} href={category.href} className="group block">
            <div className="relative overflow-hidden rounded-xl shadow-sm group-hover:shadow-lg transition-shadow duration-300">
              <Image
                src={category.image}
                alt={category.name}
                width={400}
                height={300}
                className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={category.dataAiHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 md:p-4">
                <h3 className="text-white text-md md:text-xl font-semibold">{category.name}</h3>
                <Button size="sm" className={cn("mt-2 h-8 px-3 text-xs", buttonColor)}>
                  Shop Now
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
