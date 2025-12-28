import UploadForm from '../../../components/UploadForm';

export default function UploadPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Add a New Bench</h1>
                    <p className="mt-2 text-gray-600">Share a beautiful resting spot with the world.</p>
                </div>
                <UploadForm />
            </div>
        </main>
    );
}
