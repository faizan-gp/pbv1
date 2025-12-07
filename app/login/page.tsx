import { LoginForm } from "@/app/components/AuthForms";
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-indigo-900/5">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to access your saved designs
                    </p>
                </div>

                <LoginForm />

                <div className="text-center mt-4">
                    <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
