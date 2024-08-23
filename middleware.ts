import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { use } from "react";

// define pulic route
const isPublicRoute = createRouteMatcher(["/signin", "/signup", "/", "/home"]);

// public route for videos 

const isPublicApiRoutes= createRouteMatcher([
    "/api/videos"
])
export default clerkMiddleware((auth, req)=>{
    const {userId}= auth();
    // get the current url
    // sometimes it is work req.url but we need to make sure new URL(req.url)
    const currentUrl= new URL(req.url);

    // check if it is homepage
    const isAccessingDashboard= currentUrl.pathname==="/home";
    
    // check if api req
    const isApiRequest= currentUrl.pathname.startsWith("/api");

    // if logged in
    if(userId && isPublicApiRoutes(req) && !isAccessingDashboard){
        return NextResponse.redirect(new URL("/home", req.url))
    }

    // if not logged in
    if(!userId){
        if(!isPublicRoute(req) && !isPublicApiRoutes(req)){
            return NextResponse.redirect(new URL("/signin", req.url ))
        }
// if API routes abd not loggeed in
        if(isApiRequest && !isPublicApiRoutes(req)){
            return NextResponse.redirect(new URL("/signin", req.url ));
        }

    }
// retun response and pass to next
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.*|_next).*)", "/","/(api|trpc)(.*)"],
};
