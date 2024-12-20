import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import profile from '../profile_icon.svg'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, where, limit } from "firebase/firestore";
import Post from "../components/Post";

const Profile = () =>{
    const auth = getAuth();
    const user = auth.currentUser;
    const [profileImg, setProfileImg] = useState(profile);
    const [posts, setPosts] = useState([]);

    const navigate = useNavigate();
    const onLogoutClick = () =>{
        signOut(auth).then(() => {
            alert('로그아웃 되었습니다.');
            navigate("/");
        // Sign-out successful.
        }).catch((error) => {
        // An error happened.
        console.log(error);
        });
    }
    const getUserPosts = () =>{
        const q = query(collection(db, "posts"),where("uid", "==", user.uid), orderBy('date','desc'), limit(10));
                onSnapshot(q, (querySnapshot) => {
                    const postArr = querySnapshot.docs.map((doc) => ({
                        ...doc.data(),
                        id:doc.id  
                    }))
                    setPosts(postArr);
                    console.log(posts)
                })
    }

    useEffect(() => {
        user.photoURL.includes('firebase') && setProfileImg(user.photoURL)
        getUserPosts();
    },[])
    console.log(posts)
    const updateLogo =  async (e) => {
        const {target:{files}} = e;
        const file = files[0];
        const storage = getStorage();
        const profileLogoRef = ref(storage, `avatars/${user.uid}`);
        const result = await uploadBytes(profileLogoRef, file);
        const profileUrl = await getDownloadURL(result.ref);
        //console.log(profileUrl);
        setProfileImg(profileUrl);
        await updateProfile(user, {
            photoURL:profileUrl
        })
    }
    return(
        <>
            <div className="profile">
                <div>
                    <img src={profileImg} className="profile-logo" alt="logo"/>
                    <h3>{user.displayName}</h3>
                </div>
                <input type="file" className="hidden" accept="image/*" name="profile" id="profile" onChange={updateLogo} />
                <label type="button" htmlFor="profile">Update Profile</label>
                <button onClick={onLogoutClick}>Logout</button>
            </div>
            <hr/>
            <h3>My Post List</h3>
            <h3>Post List</h3>
            <ul>
                {
                    posts.map(item => (
                        <Post key={item.id} postObj={item} isOwener={item.uid === user.uid}/>
                    ))
                }
            </ul>
        </>
    )
}

export default Profile;