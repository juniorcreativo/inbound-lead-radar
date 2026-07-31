import { prisma } from "@/lib/prisma";
import { SubredditSettings } from "@/components/settings/SubredditSettings";
import { PhraseSettings } from "@/components/settings/PhraseSettings";

export default async function SettingsPage() {
  const [subreddits, phrases] = await Promise.all([
    prisma.subredditConfig.findMany({ orderBy: { name: "asc" } }),
    prisma.intentPhrase.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage which subreddits are monitored and which phrases trigger a match.
        </p>
      </div>
      <SubredditSettings initialSubreddits={subreddits} />
      <PhraseSettings initialPhrases={phrases} />
    </div>
  );
}
