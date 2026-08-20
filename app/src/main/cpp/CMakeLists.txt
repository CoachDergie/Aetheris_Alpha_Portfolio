cmake_minimum_required(VERSION 3.22.1)

project("aetheris_native")

# Set C++20 standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(aetheris_native SHARED
    xr_bridge.cpp
)

find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(aetheris_native
    ${log-lib}
    ${android-lib}
)
