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
  const notFollowingBack = Array.from(followingSet).filter((username, i, arr) => !followersSet.has(username) && arr.indexOf(username) === i);
  const listDiv = document.getElementById('unfollowersList');
  // Clear previous results
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


const analyzeBtn = document.getElementById('analyzeBtn');
analyzeBtn.onclick = async () => {
  if (analyzeBtn.disabled) return;
  analyzeBtn.disabled = true;
  try {
    const followersFile = document.getElementById('followersFile').files[0];
    const followingFile = document.getElementById('followingFile').files[0];
    if (!followersFile || !followingFile) {
      alert('Please upload both followers_1.json and following.json files.');
      analyzeBtn.disabled = false;
      return;
    }
    const [followersText, followingText] = await Promise.all([
      followersFile.text(),
      followingFile.text()
    ]);
    const followersJson = JSON.parse(followersText);
    const followingJson = JSON.parse(followingText);
    const followersSet = parseFollowers(followersJson);
    const followingSet = parseFollowing(followingJson);
    document.getElementById('results').style.display = '';
    await showUnfollowers(followersSet, followingSet);
  } catch (e) {
    alert('Error parsing files. Please make sure you selected the correct Instagram data files.');
  }
  analyzeBtn.disabled = false;
};
