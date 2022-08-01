import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { uriFor, sanityClient } from '../sanity';
import { Collection } from '../typings';
// import Image from 'next/image';

interface Props {
	collections: Collection[];
}

const Home = ({ collections }: Props) => {
	return (
		<div className='max-w-7xl min-h-screen mx-auto flex flex-col px-10 2xl:px-0 2xl:justify-between'>
			<Head>
				<title>NFT Drops</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<header className='flex items-center justify-between mt-5'>
				<h1 className='mb-10 text-4xl font-extralight'>
					My{' '}
					<span className='font-extrabold underline decoration-pink-600/50'>
						Own
					</span>{' '}
					Market Place NFT
				</h1>
			</header>
			<main className='bg-gradient-to-br from-slate-200/75 to-zinc-300 p-10 shadow-lg rounded-xl shadow-rose-400/75'>
				<div className='grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
					{collections.map((collection, index) => (
						<Link key={index} href={`/nft/${collection.slug.current}`}>
							<div className='flex flex-col space-y-2 items-center cursor-pointer mt-5 transition-all duration-200 hover:scale-105 hover:rotate-1 group'>
								<img
									className='h-80 w-80 rounded-2xl object-cover group-hover:shadow-lg group-hover:shadow-rose-300/75'
									src={uriFor(collection.mainImage).url()}
									alt=''
								/>
								<div>
									<h2 className='text-3xl text-center'>{collection.title}</h2>
									<p className='text-sm text-gray-500 text-center'>
										{collection.description}
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</main>
			<footer className='mt-10 border-t-2 border-rose-600/50 py-6 text-center text-sm font-medium uppercase'>
				Made By <Link href={'https://matiasp.vercel.app'}><span className='text-cyan-600 cursor-pointer'>Matias Palomo</span></Link>
			</footer>
		</div>
	);
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
	const query = `*[_type == 'collection']{
		_id,
		title,
		address,
		description,
		nftCollectionName,
		mainImage{
		  asset
		},
		previewImage{
		  asset
		},
		slug{
		  current
		},
		creator->{
		  _id,
		  name,
		  address,
		  slug {
			current
		  },
		},
	  }`;

	const collections = await sanityClient.fetch(query);

	return {
		props: {
			collections,
		},
	};
};
