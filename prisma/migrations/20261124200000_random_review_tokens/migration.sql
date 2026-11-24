-- Review links grant access without a login. Replace cuid() tokens (partly time-based) with
-- 256 bits of randomness from gen_random_uuid(). Existing review links stop working; share the new link.
UPDATE "public"."Brand"
SET "reviewToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
