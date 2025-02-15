"use client";

import Image from "next/image";
import { useState } from "react";
import { generateGeminiResponse } from "./actions";

export default function TestAPIPage() {
	const [response, setResponse] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const imageFile = formData.get("image") as File;

		if (!imageFile) return;

		setLoading(true);
		try {
			const result = await generateGeminiResponse(formData);
			setResponse(result);
		} catch (error) {
			console.error("Error:", error);
			setResponse("An error occurred while generating the response.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-2xl">
				<Image
					className="dark:invert"
					src="/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>

				<div className="w-full space-y-4">
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<input
							type="file"
							name="image"
							accept="image/*"
							className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
						/>
						<button
							type="submit"
							disabled={loading}
							className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 disabled:opacity-50"
						>
							{loading ? "Analyzing..." : "Analyze Image"}
						</button>
					</form>

					{response && (
						<div className="mt-6 p-4 border rounded-lg bg-white/5">
							<h2 className="text-lg font-semibold mb-2">Analysis:</h2>
							<p className="whitespace-pre-wrap">{response}</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
