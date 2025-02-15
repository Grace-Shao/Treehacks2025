import UploadFileButton from "@/components/ui/uploadFileButton"

export default function UploadOneVideoPage() {
    return (
      <main className="flex flex-col items-center justify-center bg-black p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Upload a video to catch shoplifters</h1>
            <div className="flex justify-center">
                <UploadFileButton />
            </div>
        </div>
      </main>
    )
  }
  