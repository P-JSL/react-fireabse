import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, onSnapshot} from "firebase/firestore";
import Post from "../components/Post";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const Home = ({userObj}) => {
    const [post, setPost] = useState('');
    const [posts, setPosts] = useState([]);
    const [attachment, setAttachment] = useState();
    const storage = getStorage();
    const storageRef = ref(storage);

    let attachmentUrl = '';
    /*const getPosts = async() =>{
        const querySnapshot = await getDocs(collection(db, "posts"));
        querySnapshot.forEach((doc) => {
        // console.log(doc.data());
        const postObj = {
            ...doc.data(),
            id:doc.id
        }
        setPosts((prev) => [postObj, ...prev]);
        });
    }*/
    useEffect(() => {
        // getPosts();
        const q = query(collection(db, "posts"), orderBy('date'));
        
        onSnapshot(q, (querySnapshot) => {
            const postArr = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id:doc.id  
            }))
            setPosts(postArr);
        })

    },[]);

    const onChange = (e) =>{
        const {target:{value}} = e;
        setPost(value)
    }   
    const onSubmit = async (e) =>{
        e.preventDefault();
        const storageRef = ref(storage, `${userObj.uid}/${uuidv4()}`);

        const makePost = async  (url) =>{
            try{
                const docRef = await addDoc(collection(db, "posts"), {
                    content : post,
                    date: serverTimestamp(),
                    uid : userObj.uid,
                    attachmentUrl : url,
                    name : userObj.displayName
                });
                setAttachment('');
                setPost('');
                myForm.reset();
            }catch(e){
                console.log("error : " ,e);
            }
        }
        if(attachment){
            uploadString(storageRef, attachment, 'data_url').then(async (snapshot) => {
                // console.log('Uploaded a data_url string!');
                attachmentUrl = await getDownloadURL(storageRef);
                makePost(attachmentUrl);
            });
        }else{
            makePost(attachmentUrl);
        }
    }
    let myForm = document.querySelector('form');
    

    const onFileChange = (e) => {
        // const thefile = e.target.files[0];
        const {target:{files}} = e;
        const theFile = files[0];
        if(theFile.size > 2 * 1024 * 1024){
            alert('2MB 바이트 이상 이미지는 업로드 불가!');
            myForm.reset();
        }else{
            const reader = new FileReader();
            reader.onloadend = (e) =>{
                // console.log(e);
                const {target:{result}} = e;
                setAttachment(result);
            }
            reader.readAsDataURL(theFile);
        }
    }
    const onClearFile = () => {
        setAttachment();
    }
    return (
        <div>
            <form onSubmit={onSubmit}>
                <p>
                    <input type="text" placeholder="새 포스트를 입력하세요." value={post} onChange={onChange}/>
                    <input type="file" accept="image/*" onChange={onFileChange}/>
                </p>
                {
                    attachment && (
                    <>
                        <img src={attachment} width="100px" alt="" />
                        <button type="button" onClick={onClearFile}>업로드 취소</button>
                    </>
                    )
                }
                <p>
                    <button type="submit">입력</button>
                </p>
            </form>
            <hr/>
            <h3>Post List</h3>
            <ul>
                {
                    posts.map(item => (
                        <Post key={item.id} postObj={item} isOwener={item.uid === userObj.uid}/>
                    ))
                }
            </ul>
        </div>
    )
}

export default Home;