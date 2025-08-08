import { AppRouting } from '@/routing/app-routing';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/auth/context/auth-context';
import { I18nProvider } from './providers/i18n-provider';
import { ModulesProvider } from './providers/modules-provider';
import { QueryProvider } from './providers/query-provider';
import { SettingsProvider } from './providers/settings-provider';
import { ThemeProvider } from './providers/theme-provider';
import { TooltipsProvider } from './providers/tooltips-provider';
import { ProfileProvider } from './context/profile-context';

const { BASE_URL } = import.meta.env;

export function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <AuthProvider> */}
        <SettingsProvider>
          <ThemeProvider>
            <I18nProvider>
              <HelmetProvider>
                <TooltipsProvider>
                  <QueryProvider>
                    <ProfileProvider>
                      <LoadingBarContainer>
                        <BrowserRouter basename={BASE_URL}>
                          <Toaster richColors position="top-right" />
                          <ModulesProvider>
                            <AppRouting />
                          </ModulesProvider>
                        </BrowserRouter>
                      </LoadingBarContainer>
                    </ProfileProvider>
                  </QueryProvider>
                </TooltipsProvider>
              </HelmetProvider>
            </I18nProvider>
          </ThemeProvider>
        </SettingsProvider>
      {/* </AuthProvider> */}
    </QueryClientProvider>
  );
}
