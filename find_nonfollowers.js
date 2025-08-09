const fs = require('fs');
const path = require('path');

const followersPath = path.join(__dirname, 'connections', 'followers_and_following', 'followers_1.json');
const followingPath = path.join(__dirname, 'connections', 'followers_and_following', 'following.json');

// Load followers
const followersData = JSON.parse(fs.readFileSync(followersPath, 'utf-8'));
const followers = new Set(
  followersData
    .flatMap(item =>
      Array.isArray(item.string_list_data)
        ? item.string_list_data.map(entry => entry.value)
        : []
    )
    .filter(Boolean)
    .map(username => username.trim().toLowerCase())
);

// Load following
const followingData = JSON.parse(fs.readFileSync(followingPath, 'utf-8'));
const following = new Set(
  followingData.relationships_following
    .flatMap(item =>
      Array.isArray(item.string_list_data)
        ? item.string_list_data.map(entry => entry.value)
        : []
    )
    .filter(Boolean)
    .map(username => username.trim().toLowerCase())
);

// Find users you follow who don't follow you back
const notFollowingBack = Array.from(following).filter(username => !followers.has(username));

console.log("People you follow who don't follow you back:");
notFollowingBack.forEach(username => console.log(username));
console.log(`\nTotal: ${notFollowingBack.length}`);
