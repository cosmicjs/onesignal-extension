import queryString from 'query-string';
import cosmic from 'cosmicjs';

export const getBucket = () => {
  if (typeof window === 'undefined') return undefined;

  if (window.bucket) return window.bucket;

  const { bucket_slug } = queryString.parse(window.location.search);

  const Cosmic = cosmic();
  window.bucket = Cosmic.bucket({ slug: bucket_slug });
  return window.bucket;
};

export const getBucketSlug = () => {
  if (typeof window === 'undefined') return undefined;

  if (window.bucket_slug) return window.bucket_slug;

  const { bucket_slug } = queryString.parse(window.location.search);
  window.bucket_slug = bucket_slug;
  return window.bucket_slug;
};

export const getBucketInfo = async() => {
  if (typeof window === 'undefined') return undefined;

  if (window.bucket_data) return window.bucket_data;

  const { bucket_slug } = queryString.parse(window.location.search);
  const Cosmic = cosmic();
  const bucket = Cosmic.bucket({ slug: bucket_slug });
   await bucket.getBucket().then(data => {
    window.bucket_data = data;
  })
  return window.bucket_data;
}