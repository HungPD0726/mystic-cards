import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReadingResult from './ReadingResult';
import type { StoredReading } from '@/lib/readingSession';
import { generateTarotInterpretation } from '@/lib/geminiService';

const { useAuthMock, generateTarotInterpretationMock, fromMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  generateTarotInterpretationMock: vi.fn(),
  fromMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: useAuthMock,
}));

vi.mock('@/lib/geminiService', () => ({
  generateTarotInterpretation: generateTarotInterpretationMock,
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: fromMock,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock('@/components/TarotChat', () => ({
  TarotChat: () => <div data-testid="tarot-chat" />,
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function setCurrentReading(reading: StoredReading, autoAI = false) {
  sessionStorage.setItem('tarot-current-reading', JSON.stringify(reading));
  if (autoAI) {
    sessionStorage.setItem('tarot-auto-ai', 'true');
  } else {
    sessionStorage.removeItem('tarot-auto-ai');
  }
}

function renderReadingResult() {
  return render(
    <MemoryRouter initialEntries={['/reading/one-card/result']}>
      <Routes>
        <Route path="/reading/:spread/result" element={<ReadingResult />} />
      </Routes>
    </MemoryRouter>,
  );
}

function createSupabaseReadingsMock(getUpdateResult: () => Promise<{ error: unknown }> | { error: unknown }) {
  const singleMock = vi.fn().mockResolvedValue({
    data: { id: 'cloud-reading-1' },
    error: null,
  });
  const selectMock = vi.fn(() => ({ single: singleMock }));
  const insertMock = vi.fn(() => ({ select: selectMock }));
  const updateEqUserMock = vi.fn(() => Promise.resolve(getUpdateResult()));
  const updateEqIdMock = vi.fn(() => ({ eq: updateEqUserMock }));
  const updateMock = vi.fn(() => ({ eq: updateEqIdMock }));

  fromMock.mockImplementation(() => ({
    insert: insertMock,
    update: updateMock,
  }));

  return { insertMock, singleMock, updateMock, updateEqIdMock, updateEqUserMock };
}

const baseReading: StoredReading = {
  spreadType: 'one-card',
  spreadName: 'Một Lá',
  createdAt: '2026-03-26T00:00:00.000Z',
  aiInterpretation: null,
  drawnCards: [
    {
      cardId: 1,
      cardName: 'The Magician',
      cardSlug: 'the-magician',
      orientation: 'upright',
      position: 'Hiện tại',
      imagePath: '/cards/the-magician.jpg',
      keywords: ['Khởi đầu', 'Ý chí'],
      uprightMeaning: 'Bạn có đủ nguồn lực để bắt đầu.',
      reversedMeaning: 'Bạn đang phân tán năng lượng.',
      description: 'Lá bài của hành động và ý chí.',
    },
  ],
};

describe('ReadingResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    useAuthMock.mockReturnValue({ isAuthenticated: false, user: null });
  });

  it('updates the saved cloud reading when AI finishes after the user already saved', async () => {
    const deferred = createDeferred<string>();
    const { insertMock, updateMock, updateEqIdMock, updateEqUserMock } = createSupabaseReadingsMock(() => ({ error: null }));

    useAuthMock.mockReturnValue({ isAuthenticated: true, user: { id: 'user-1' } });
    generateTarotInterpretationMock.mockReturnValue(deferred.promise);
    setCurrentReading(baseReading, true);

    renderReadingResult();

    await waitFor(() => expect(generateTarotInterpretation).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Lưu lịch sử/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        ai_interpretation: null,
      }),
    );

    await act(async () => {
      deferred.resolve('Luận giải hoàn chỉnh');
      await deferred.promise;
    });

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith({ ai_interpretation: 'Luận giải hoàn chỉnh' }));
    expect(updateEqIdMock).toHaveBeenCalledWith('id', 'cloud-reading-1');
    expect(updateEqUserMock).toHaveBeenCalledWith('user_id', 'user-1');

    expect(JSON.parse(sessionStorage.getItem('tarot-current-reading') ?? '{}')).toEqual(
      expect.objectContaining({
        aiInterpretation: 'Luận giải hoàn chỉnh',
      }),
    );
  });

  it('updates the guest local history entry with AI text without creating duplicates', async () => {
    const deferred = createDeferred<string>();

    generateTarotInterpretationMock.mockReturnValue(deferred.promise);
    setCurrentReading(baseReading, true);

    renderReadingResult();

    await waitFor(() => expect(generateTarotInterpretation).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Lưu lịch sử/i }));

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('tarot-reading-history') ?? '[]')).toEqual([
        expect.objectContaining({
          aiInterpretation: null,
        }),
      ]),
    );

    await act(async () => {
      deferred.resolve('Luận giải cho khách');
      await deferred.promise;
    });

    await waitFor(() => {
      const history = JSON.parse(localStorage.getItem('tarot-reading-history') ?? '[]');
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(
        expect.objectContaining({
          aiInterpretation: 'Luận giải cho khách',
        }),
      );
    });
  });

  it('allows retrying AI sync after the automatic cloud update fails', async () => {
    const deferred = createDeferred<string>();
    let updateError: unknown = { message: 'sync failed' };
    const { updateMock } = createSupabaseReadingsMock(() => ({ error: updateError }));

    useAuthMock.mockReturnValue({ isAuthenticated: true, user: { id: 'user-1' } });
    generateTarotInterpretationMock.mockReturnValue(deferred.promise);
    setCurrentReading(baseReading, true);

    renderReadingResult();

    await waitFor(() => expect(generateTarotInterpretation).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Lưu lịch sử/i }));

    await act(async () => {
      deferred.resolve('Luận giải cần retry');
      await deferred.promise;
    });

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('button', { name: /Lưu lại luận giải AI/i })).toBeEnabled());
    expect(toastErrorMock).toHaveBeenCalled();

    updateError = null;
    fireEvent.click(screen.getByRole('button', { name: /Lưu lại luận giải AI/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole('button', { name: /Đã lưu/i })).toBeDisabled());
  });
});
