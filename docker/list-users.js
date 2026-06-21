const users = db.users
  .aggregate([
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $project: {
        email: 1,
        username: 1,
        name: 1,
        emailVerified: 1,
        createdAt: 1,
        hasPassword: {
          $cond: [{ $ifNull: ["$passwordHash", false] }, true, false],
        },
        hasAvatar: {
          $cond: [{ $ifNull: ["$avatarKey", false] }, true, false],
        },
      },
    },
  ])
  .toArray();

function fmt(value) {
  if (value == null) return "—";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

if (users.length === 0) {
  print("No users in collection `users`.");
  quit(0);
}

print(`Users (${users.length}):\n`);

users.forEach((user, index) => {
  print(`${index + 1}. ${user._id}`);
  print(`   email:     ${fmt(user.email)}`);
  print(`   username:  ${fmt(user.username)}`);
  print(`   name:      ${fmt(user.name)}`);
  print(`   verified:  ${user.emailVerified ? fmt(user.emailVerified) : "no"}`);
  print(`   password:  ${user.hasPassword ? "yes" : "no"}`);
  print(`   avatar:    ${user.hasAvatar ? "yes" : "no"}`);
  print(`   created:   ${fmt(user.createdAt)}`);
  print("");
});
