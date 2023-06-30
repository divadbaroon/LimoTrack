'use client'
import { CarCard } from "@/components"
import { CarCardSkeleton, ProfileSkeleton } from "@/components/skeleton"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"

const Profile = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [coverImageSource, setCoverImageSource] = useState<string | null>(null);
    const [accepetedFile, SetAcceptedFile] = useState<File>();
    const [cars, setCars] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleCoverImageSourceChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files;
        if (file) {
            const url = `${URL.createObjectURL(file[0])}`;
            setCoverImageSource(url);
            SetAcceptedFile(file[0]);
        }
    }


    useEffect(() => {
        const getUserProfile = async () => {
            const res = await fetch(`/api/profile/${session?.user?.id}`);
            const data = await res.json();
            setCoverImageSource(data.coverImage);
        };


        const getCars = async () => {
            try {
                const res = await fetch(`/api/car/user/${session?.user?.id}`);
                const data = await res.json();
                setCars(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        getUserProfile();
        getCars();
    }, [session?.user?.id, cars]);

    useEffect(() => {
        const getBase64 = (file: File) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const res = await fetch(`/api/profile/${session?.user?.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            coverImage: reader.result
                        })
                    });
                    if (res.ok) {
                        alert('Cover Image Updated.');
                    }
                } catch (error) {
                    alert('Failed to update cover photo.')
                } finally {
                    SetAcceptedFile(undefined);
                }
            };
            reader.onerror = () => {
                // log the error
                console.error(reader.error);
            }
        };
        if (accepetedFile) {
            getBase64(accepetedFile);
        }

    }, [session?.user?.id, accepetedFile]);

    const handleDelete = async (_id: string) => {
        const doYouReallyWannaToDelete = confirm('Do you really want to delete?');
        if (!doYouReallyWannaToDelete) return;
        try {
            await fetch(`/api/car/user/${_id}`, {
                method: 'DELETE'
            })
        } catch (error) {
            alert('failed to delete.');
        } finally {
            alert('deleted successfully.');
        }
    };
    const handleEdit = async (_id: string) => {
        router.push(`/cars/edit/${_id}`);
    }


    return (
        <section className=' relative pt-16 md:pt-24 '>
            <div className='relative h-52 md:h-64'>
                {
                    coverImageSource && <Image src={coverImageSource || '/images/car.webp'} quality={100} alt='cover photo' fill className='object-cover w-full bg-top h-full ' />
                }
            </div>
            <div className='max-w-[1440px] mx-auto'>
                <div className={`relative bg-zinc-600`}>
                    <div className='py-1.5 md:py-2.5 px-5 bg-white/30 backdrop-blur rounded-full absolute right-2 bottom-2 shadow text-sm '>
                        <label htmlFor='file-input' className='flex items-center cursor-pointer'>
                            <Image src={'/icons/edit.svg'} alt='file uploader icon' width={20} height={20} className='object-contain mr-2' />
                            <span>Edit Cover</span>
                        </label>
                        <input type='file' id='file-input' onChange={handleCoverImageSourceChange} className='hidden' />
                    </div>
                    <div className='h-24 w-24 md:h-40 md:w-40 absolute left-2 -bottom-8 md:-bottom-10 rounded-full p-2 md:p-2 shadow-2xl border-4 md:border-[8px] border-white'>
                        <Image src={session?.user?.image || 'https://api.multiavatar.com/user.svg'} alt='profile photo' fill className='object-contain rounded-full' quality={100} />
                    </div>
                </div>
                <div className='rounded-lg w-full pt-9 md:pt-12 p-2 md:p-6 leading-5'>
                    <h1 className='text-lg md:text-2xl font-bold'>{session?.user?.name}</h1>
                    <p className='text-gray-500 text-sm'>{session?.user?.email}</p>
                    <small className='text-gray-400'>#{session?.user?.id}</small>
                </div>
                <div className='mt-12 p-2'>
                    {
                        (cars.length === 0 && (!isLoading)) ? (
                            <h1>Add your first car...</h1>
                        ) : <div>
                            <h1 className='text-lg md:text-2xl font-bold'>My Cars</h1>
                            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2'>
                                {
                                    cars.map((car, index) => (
                                        <CarCard key={index} car={car} handleDelete={handleDelete} handleEdit={handleEdit} />
                                    ))
                                }
                            </div>
                        </div>
                    }
                    {
                        isLoading && <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2'>
                            {
                                Array(8).fill(0).map((_, i) => (
                                    <CarCardSkeleton key={i} />
                                ))
                            }
                        </div>
                    }
                </div>
            </div>
        </section>
    )
}

export default Profile