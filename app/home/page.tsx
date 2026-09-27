import { auth } from "@/auth";
import { deleteUser, doLogout } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
  const currentEmail = session.user?.email?.trim().toLowerCase();
  const isAdmin = Boolean(
    currentEmail && currentEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  );

  return (
    <main className="directory-page">
      <header className="directory-header">
        <a className="directory-brand" href="/">
          <span className="directory-brand-mark">N</span>
          <span>Northstar</span>
        </a>
        <div className="account-controls">
          <div className="signed-in-user">
            <span className="user-avatar" aria-hidden="true">
              {(session.user?.name ?? session.user?.email ?? "U").slice(0, 1).toUpperCase()}
            </span>
            <span className="signed-in-name">{session.user?.name ?? session.user?.email ?? "User"}</span>
          </div>
          <form action={doLogout}>
            <button type="submit" className="logout-button">Sign out</button>
          </form>
        </div>
      </header>

      <section className="directory-content">
        <div className="directory-heading">
          <div>
            <p className="directory-eyebrow">Workspace / People</p>
            <h1>People</h1>
            <p className="directory-description">Manage the people who have access to your workspace.</p>
          </div>
          <div className="member-count" aria-label={`${users.length} total members`}>
            <span className="count-value">{users.length.toString().padStart(2, "0")}</span>
            <span className="count-label">Total members</span>
          </div>
        </div>

        <div className="directory-toolbar">
          <div>
            <h2>All members</h2>
            <p>{users.length === 1 ? "1 person in your workspace" : `${users.length} people in your workspace`}</p>
          </div>
          {isAdmin && <span className="admin-indicator"><span /> Admin access</span>}
        </div>

        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Email address</th>
                <th scope="col">Status</th>
                {isAdmin && <th scope="col" className="actions-heading">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrentUser = user.email.toLowerCase() === currentEmail;

                return (
                  <tr key={user.id}>
                    <td data-label="Member">
                      <div className="member-identity">
                        <span className="member-avatar" aria-hidden="true">
                          {user.name.trim().slice(0, 1).toUpperCase() || "U"}
                        </span>
                        <span className="member-name">{user.name}</span>
                        {isCurrentUser && <span className="you-label">You</span>}
                      </div>
                    </td>
                    <td data-label="Email address" className="member-email">{user.email}</td>
                    <td data-label="Status"><span className="member-status"><span /> Active</span></td>
                    {isAdmin && (
                      <td data-label="Actions" className="member-actions">
                        {!isCurrentUser && user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase() ? (
                          <form action={deleteUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button className="delete-user-button" type="submit" aria-label={`Delete ${user.name}`}>
                              Delete
                            </button>
                          </form>
                        ) : <span className="protected-label">Protected</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="empty-members">
                    <span className="empty-mark" aria-hidden="true">+</span>
                    <strong>No members yet</strong>
                    <span>New accounts will appear here when they join.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="directory-footnote">Showing all registered accounts in this workspace.</p>
      </section>
    </main>
  );
}
