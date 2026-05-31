import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const allowedEmail = process.env.ADMIN_EMAIL;
        if (user.email === allowedEmail) {
          await connectToDatabase();
          // Ensure the user exists in our DB
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'admin',
            });
          }
          return true;
        } else {
          return false; // Unauthorized email
        }
      }
      return false;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          (session.user as any).role = dbUser.role;
          (session.user as any).id = dbUser._id.toString();
        }
      }
      return session;
    },
  },
  // pages: {
  //   signIn: '/auth/signin', // We can create a custom sign-in page later if needed
  // },
  session: {
    strategy: 'jwt',
  },
};
