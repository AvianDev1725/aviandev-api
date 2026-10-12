import { apiGet, getCurrentUser } from '@/lib/api';
import { getContentByCMS } from '@/lib/content';
import CategoryManager, { type Category } from './category-manager';
import { categoriesText } from './text';

export const instant = false;

export default async function CategoriesPage() {
  const [user, categories, text] = await Promise.all([
    getCurrentUser(),
    apiGet<Category[]>('/categories').then((list) => list ?? []),
    getContentByCMS('admin-categories', categoriesText),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{text.title}</h1>
        <p className="mt-1 text-zinc-500">{text.subtitle}</p>
      </div>
      <CategoryManager categories={categories} text={text} canDelete={user?.role === 'super_admin'} />
    </div>
  );
}