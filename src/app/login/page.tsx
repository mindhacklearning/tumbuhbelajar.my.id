import GoogleSignInButton from "@/components/GoogleSignInButton"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">BD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke TumbuhBelajar</h1>
          <p className="text-gray-600 mt-2">Login dengan akun Google Anda</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <GoogleSignInButton />

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Dengan masuk, Anda menyetujui</p>
            <p className="mt-1">
              <a href="/terms" className="text-blue-600 hover:underline">Syarat & Ketentuan</a>
              {' '}dan{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-600">
          Belum punya akun?{' '}
          <a href="/register" className="text-blue-600 font-medium hover:underline">
            Daftar gratis
          </a>
        </p>
      </div>
    </div>
  )
}
