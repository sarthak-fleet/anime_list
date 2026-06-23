import { useParams } from '@tanstack/react-router';
import MangaDetailView from '@/components/MangaDetailView';

export default function MangaDetailPage() {
  const { malId } = useParams({ from: '/app/manga/$malId' });
  return <MangaDetailView malId={Number(malId)} />;
}
