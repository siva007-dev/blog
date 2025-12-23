import React, { useEffect } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import Footer from './common/Footer';
import auth from '../config/firebase';


function Blogs() {

    const [blogs, setBlogs] = useState([]);
    const [admin, setadmim] = useState(false)
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate("/login");
            } else {
                setadmim(user.uid === "Qi1YOVxkHifvcLe27YqSM8hneon1");
            }
            setCheckingAuth(false)
        });

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blogs`)
            .then(res => setBlogs(res.data))
            .catch(err => console.error(err));

        return () => unsubscribe(); // ✅ cleanup
    }, [navigate]);

    if (checkingAuth) {
  return <div className="text-center mt-20">Loading...</div>;
}


    const handleLike = async (blog_id) => {
        try {
            const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/blogs/like/${blog_id}`);
            // After successfully updating the likes count in the backend, fetch the updated list of blogs
            if (response.status === 200) {
                axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blogs`).then((res) => {
                    console.log(res.data)
                    setBlogs(res.data)
                }).catch(() => {
                    console.log("Error fetching data")
                })
            }
        } catch (error) {
            console.error('Error liking the blog post:', error);
        }
    };

    const handleNewBlogSubmit = (event) => {
        event.preventDefault(); // Prevent form from refreshing the page
        const today = new Date();
        const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });


        const likes = 0
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/blogs`, { newTitle, date, newContent, likes }).then((res) => {
            console.log(res.data)

            axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blogs`).then((res) => {
                console.log(res.data)
                setBlogs(res.data)
            }).catch(() => {
                console.log("Error fetching data")
            })

        });




        setNewTitle('');
        setNewContent('');
    };

    return (
        <div className="blog-section py-14">
            <h2 className="text-center text-5xl font-bold mb-14">Latest  <span className='text-orange-400'>Blogs</span> 📚</h2>

            {/* Blog creation form */}

            {admin ?
                <div className="blog-creation-form mb-8" style={{ width: "80%", margin: "auto" }}>
                    <form onSubmit={handleNewBlogSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Blog Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <textarea
                            placeholder="Blog Content"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="p-2 border rounded"
                            rows="4"
                            required
                        />
                        <button type="submit" className="bg-orange-400 text-white p-2 rounded hover:bg-orange-600">
                            Add Blog
                        </button>
                    </form>
                </div> : ""}

            <div className="blogs-container grid grid-cols-1 md:grid-cols-2 gap-6 container mx-auto px-4">
                {Array.isArray(blogs) && blogs.map((blog) => (
                    <div key={blog._id} className="blog-post mb-8 p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="blog-title font-semibold text-2xl text-gray-800 mb-3">{blog.newTitle}</h3>
                        <p className="blog-date text-gray-400 text-sm mb-4">{blog.date}</p>
                        <p className="blog-content text-gray-600 mb-4">{blog.newContent}</p>
                        <span className="text-blue-500 cursor-pointer" onClick={() => handleLike(blog._id)}>Like</span>
                        <span className="ml-2">{blog.likes} Likes</span>
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    );
}

export default Blogs