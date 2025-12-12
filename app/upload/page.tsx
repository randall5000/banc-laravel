import Header from '@/components/Header';
import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Share a Bench
          </h1>
          <p className="text-lg text-gray-600">
            Found a beautiful bench? Share it with the Banconaut community!
          </p>
        </div>

        <UploadForm />
      </main>
    </div>
  );
}
