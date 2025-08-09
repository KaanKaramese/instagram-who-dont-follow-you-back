function parseFollowers(json) {
  return new Set(
    json
      .flatMap(item =>
        Array.isArray(item.string_list_data)
          ? item.string_list_data.map(entry => entry.value.trim().toLowerCase())
          : []
      )
      .filter(Boolean)
  );
}

function parseFollowing(json) {
  return new Set(
    (json.relationships_following || [])
      .flatMap(item =>
        Array.isArray(item.string_list_data)
          ? item.string_list_data.map(entry => entry.value.trim().toLowerCase())
          : []
      )
      .filter(Boolean)
  );
}

async function fetchProfilePic(username) {
  // Use Instagram public page to get profile pic (scrape og:image)
  try {
    const resp = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, { headers: { 'Accept': 'application/json' } });
    if (resp.ok) {
      const data = await resp.json();
      // For new Instagram web, profile pic is at data.graphql.user.profile_pic_url_hd or similar
      if (data.graphql && data.graphql.user && data.graphql.user.profile_pic_url_hd) {
        return data.graphql.user.profile_pic_url_hd;
      }
      // fallback for other structures
      if (data.user && data.user.profile_pic_url_hd) {
        return data.user.profile_pic_url_hd;
      }
    }
  } catch (e) {}
  // fallback to default avatar
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username) + '&background=eee&color=555&size=128';
}

async function showUnfollowers(followersSet, followingSet) {
  const notFollowingBack = Array.from(followingSet).filter(username => !followersSet.has(username));
  const listDiv = document.getElementById('unfollowersList');
  listDiv.innerHTML = '';
  if (notFollowingBack.length === 0) {
    listDiv.innerHTML = '<p>Everyone you follow follows you back. 🎉</p>';
    return;
  }
  for (const username of notFollowingBack) {
    const card = document.createElement('div');
    card.className = 'unfollower-card';
    const img = document.createElement('img');
    img.src = await fetchProfilePic(username);
    img.alt = username;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'username';
    nameSpan.textContent = username;
    const link = document.createElement('a');
    link.className = 'profile-link';
    link.href = `https://instagram.com/${username}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'View';
    card.appendChild(img);
    card.appendChild(nameSpan);
    card.appendChild(link);
    listDiv.appendChild(card);
  }
}


// No event handler here. Use docs/app.js for the web app logic.
