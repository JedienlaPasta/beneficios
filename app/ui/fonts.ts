import { Roboto, Inter,Manrope, Roboto_Mono } from 'next/font/google';

export const roboto = Roboto({
    weight: ['400', '700', '900'],
    subsets: ['latin'],
});

export const inter = Inter({
    weight: ['400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
});

export const manrope = Manrope({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
});

export const roboto_mono = Roboto_Mono({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
});