export default  function Avatar({userId,username})
{
    const colors = ["bg-green-200","bg-red-200","bg-purple-200","bg-rose-200","bg-blue-200","bg-yellow-200","bg-teal-200"]

    const userIdBase10 = parseInt(userId,16);
    const colorIndex = userIdBase10 % colors.length;

    const color = colors[colorIndex];
    return(
        <div className={`w-8 h-8 ${color}  rounded-full  flex items-center justify-center`}>
            <div className='text-center w-full'>{username[0]}</div>
        </div>
    )
}