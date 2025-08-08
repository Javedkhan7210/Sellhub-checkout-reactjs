import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

export function BrandedLayout() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const token = sessionStorage.getItem('seller_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1.png')}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1-dark.png')}');
          }
        `}
      </style>

      {/* Theme Toggle Switch */}
     

      {/* <div className="flex min-h-screen w-full justify-center items-center bg-red dark:bg-black"> */}
      {/* <Card className="w-full max-w-[400px]"> */}

      <CardContent className="p-1">
        {/* <div className='pt-4 flex items-center justify-center'>
        <img
          src={toAbsoluteUrl('/media/app/default-logo-dark.png')}
          className="h-[48px] max-w-none"
          alt=""
        />
        </div> */}
      
        <Outlet />
      </CardContent>
      {/* </Card> */}
      {/* </div> */}
    </>
  );
}
