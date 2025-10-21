import type { Metadata } from 'next';
import type { IUserItem } from 'src/types/user';

import { CONFIG } from 'src/global-config';
import { _userList } from 'src/_mock/_user';

import { UserEditView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const currentUser = _userList.find((user) => user.id === id);

  return <UserEditView user={currentUser} />;
}

// ----------------------------------------------------------------------
