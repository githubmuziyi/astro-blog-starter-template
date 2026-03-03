
import { getCollection } from 'astro:content';

async function debug() {
  const posts = await getCollection('blog');
  if (posts.length > 0) {
    console.log('Sample post keys:', Object.keys(posts[0]));
    console.log('Sample post id:', posts[0].id);
    console.log('Sample post slug:', posts[0].slug);
    console.log('Sample post data:', posts[0].data);
  } else {
    console.log('No posts found');
  }
}

debug();
