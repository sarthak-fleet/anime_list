import { useParams } from '@tanstack/react-router';
import AnimeDetailView from '@/components/AnimeDetailView';

export default function AnimeDetailPage() {
  const { malId } = useParams({ from: '/app/anime/$malId' });
  return <AnimeDetailView malId={Number(malId)} />;
}
