export function Spinner() {
  return (
    <div className="animate-cspin h-5 w-5 rounded-full border-4 border-blue-200 border-t-blue-400 bg-transparent"></div>
  );
}

export function SquaresLoader() {
  return (
    <div className="relative mx-auto my-2 flex h-16 w-16 items-center justify-center">
      <div className="absolute h-full w-full animate-square rounded-md bg-gradient-to-br from-blue-500 to-blue-600 opacity-70 shadow-md"></div>
      <div className="absolute inset-2 animate-innerSquare rounded-sm bg-gradient-to-tr from-blue-200 to-blue-300 shadow-inner"></div>
    </div>
  );
}

export function LinearLoader() {
  return (
    <div className="relative my-6 h-[70px] w-[70px]">
      <div className='absolute left-[10px] top-0 block h-[10px] w-[10px] rotate-[70deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#3f93e0] before:content-[""]' />
      <div className='absolute right-0 top-[10px] block h-[10px] w-[10px] rotate-[160deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#1655a1] before:content-[""]' />
      <div className='absolute bottom-0 right-[10px] block h-[10px] w-[10px] rotate-[-110deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#3f93e0] before:content-[""]' />
      <div className='absolute bottom-[10px] left-0 block h-[10px] w-[10px] rotate-[-20deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#1655a1] before:content-[""]' />
    </div>
  );
}
