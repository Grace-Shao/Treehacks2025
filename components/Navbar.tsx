// components/Navbar.js
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav className="bg-grey bg-opacity-70 shadow-md text-gray">
            <div className="container mx-auto px-6 py-4 flex justify-center">
                <div className="flex items-center space-x-8">
                    {/* <Image src="/gamestock logo.png" alt="GameStock Logo" width={60} height={60} /> */}
                    <Link legacyBehavior href="/">
                        <a className="text-lg hover:text-white hover:underline">Home</a>
                    </Link>
                    <Link legacyBehavior href="/testAPI">
                        <a className="text-lg text-black-800 hover:text-white hover:underline">TestAPI</a>
                    </Link>
                    <Link legacyBehavior href="/mainOptionsPage">
                        <a className="text-lg text-black-800 hover:text-white hover:underline">Main Options Page</a>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
