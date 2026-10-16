import { mergeProgressSnapshots, normalizeSave, type ProgressSnapshot } from "../progress-model";
import { supabase } from "./client";

type CloudRow = {
  save: unknown;
  version: number;
  updated_at: string;
};

function requireClient() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function snapshotFromRow(row: CloudRow): ProgressSnapshot {
  return { save: normalizeSave(row.save), updatedAt: row.updated_at };
}

/** Pull, merge, and conditionally write; retry if another device wins the race. */
export async function synchronizeProgress(userId: string, local: ProgressSnapshot): Promise<ProgressSnapshot> {
  const client = requireClient();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data: remote, error: readError } = await client
      .from("navodaya_progress")
      .select("save, version, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (readError) throw readError;

    if (!remote) {
      const { data: inserted, error: insertError } = await client
        .from("navodaya_progress")
        .insert({ user_id: userId, save: local.save })
        .select("save, version, updated_at")
        .maybeSingle();
      if (insertError?.code === "23505") continue;
      if (insertError) throw insertError;
      if (!inserted) throw new Error("Cloud save was not created");
      return snapshotFromRow(inserted as CloudRow);
    }

    const cloudSnapshot = snapshotFromRow(remote as CloudRow);
    const merged = mergeProgressSnapshots(local, cloudSnapshot);
    if (JSON.stringify(merged.save) === JSON.stringify(cloudSnapshot.save)) {
      return cloudSnapshot;
    }

    const { data: updated, error: updateError } = await client
      .from("navodaya_progress")
      .update({ save: merged.save })
      .eq("user_id", userId)
      .eq("version", (remote as CloudRow).version)
      .select("save, version, updated_at")
      .maybeSingle();
    if (updateError) throw updateError;
    if (updated) return snapshotFromRow(updated as CloudRow);
  }
  throw new Error("Progress changed repeatedly on another device. Please try again.");
}
