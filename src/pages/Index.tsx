import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DailyTarotWidget } from '@/components/DailyTarotWidget';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { zodiacSigns } from '@/data/zodiac';
import { HeroSection } from '@/components/landing/HeroSection';
import { StepsSection } from '@/components/landing/StepsSection';
import { TopicsSection } from '@/components/landing/TopicsSection';
import { SpreadsSection } from '@/components/landing/SpreadsSection';
import { AboutSection } from '@/components/landing/AboutSection';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [warpMode, setWarpMode] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!isAuthenticated || !user) {
      setProfile(null);
      return () => {
        isActive = false;
      };
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (isActive) {
          setProfile(data ?? null);
        }
      } catch (error) {
        console.warn('Failed to load user profile:', error);
        if (isActive) {
          setProfile(null);
        }
      }
    };

    void fetchProfile();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, user]);

  const userZodiac = profile?.zodiac_sign
    ? zodiacSigns.find((sign) => sign.id === profile.zodiac_sign)
    : null;

  const startWarpNavigation = (path: string) => {
    setWarpMode(true);
    window.setTimeout(() => navigate(path), 460);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <HeroSection
        warpMode={warpMode}
        onStartReading={startWarpNavigation}
        userZodiac={userZodiac}
      />

      <section className="relative z-20 -mt-12 mb-16 container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <DailyTarotWidget />
        </div>
      </section>

      <StepsSection />
      <TopicsSection onStartReading={startWarpNavigation} />
      <SpreadsSection />
      <AboutSection />
    </div>
  );
};

export default Index;
