import IMG from '~/assets/images/checklist.png'


const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            <img
              src={IMG} 
              alt="To-do List Animation"
              className="w-[300px] h-[300px] mx-auto mb-6 rounded-2xl object-cover"
            />
            <h2 className="text-3xl font-bold text-white mb-4">Organize Your Tasks</h2>
            <p className="text-blue-100 text-lg">
              Stay productive and manage your daily tasks efficiently with our intuitive platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
